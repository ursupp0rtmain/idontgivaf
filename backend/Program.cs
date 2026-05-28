using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "https://idontgivaf.uk")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

builder.Services.AddSignalR();
builder.Services.AddSingleton<StatsDb>();
builder.Services.AddSingleton<VisitorTracker>();

var app = builder.Build();

app.UseCors();
app.Services.GetRequiredService<StatsDb>().Init();

string[] countries =
[
    "Germany", "Austria", "Switzerland", "France", "USA",
    "Japan", "Australia", "Canada", "Spain", "Italy",
    "Brazil", "Mexico", "Netherlands", "Poland", "Sweden",
    "Norway", "Denmark", "Finland", "Portugal", "Greece",
    "India", "China", "South Korea", "Argentina", "New Zealand",
    "Belgium", "Czech Republic", "Hungary", "Romania", "Ireland",
    "the Void", "the Cloud", "a Parallel Universe", "Nowhere",
];

string[] rejections =
[
    "tried to care. Rejected.",
    "attempted to give a f*ck. System refused.",
    "launched f*ck.exe. Process terminated instantly.",
    "simulated engagement. 406 Not Acceptable.",
    "submitted a f*ck. Return value: null.",
    "tried to give a damn. Too apathetic to process.",
    "initialized compassion. SegFault on line 1.",
    "ran caring.js. Uncaught TypeError: undefined.",
    "set CARING_LEVEL to 1. Value corrected to 0.",
    "tried to compile empathy. Build failed.",
];

string MakeRejection(string country) =>
    $"User from {country} {rejections[Random.Shared.Next(rejections.Length)]}";

// ── MAIN ENDPOINTS ────────────────────────────────────────────────────────

app.MapPost("/api/attempt", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementAttempts();
    var s = db.GetStats();
    var msg = MakeRejection(countries[Random.Shared.Next(countries.Length)]);
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });
    await hub.Clients.All.SendAsync("RejectionFeed",
        new { msg, tag = "attempt" });
    return Results.Ok();
});

app.MapPost("/api/click", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementClicks();
    var s = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });
    return Results.Ok();
});

app.MapGet("/api/stats", (StatsDb db, VisitorTracker vt) =>
{
    var s = db.GetStats();
    return Results.Ok(new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });
});

// ── FaaS ENDPOINTS ────────────────────────────────────────────────────────

app.MapGet("/api/fucks/current", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementApiCalls();
    var s = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });
    await hub.Clients.All.SendAsync("RejectionFeed",
        new { msg = "Developer called GET /api/fucks/current. Teapot replied: 418.", tag = "api" });
    return Results.Json(
        new
        {
            fucks_given = 0,
            message     = "System is too apathetic to process.",
            status      = "MAXIMUM_INDIFFERENCE",
        },
        statusCode: 418);
});

app.MapPost("/api/fucks/give", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementApiCalls();
    var s = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });
    await hub.Clients.All.SendAsync("RejectionFeed",
        new { msg = "Developer tried POST /api/fucks/give. Payload completely ignored.", tag = "api" });
    return Results.Json(
        new
        {
            fucks_given = 0,
            message     = "406 Not Acceptable: Your input has been thoroughly disregarded.",
            error       = "APATHY_OVERFLOW",
        },
        statusCode: 406);
});

app.MapHub<NothingHub>("/hub/nothing");

app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();

// ── SERVICES ──────────────────────────────────────────────────────────────

public record DbStats(long attempts, long clicks, long apiCalls);

public class StatsDb
{
    private const string ConnStr = "Data Source=nothing.db";

    public void Init()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS stats (
                id        INTEGER PRIMARY KEY CHECK (id = 1),
                attempts  INTEGER NOT NULL DEFAULT 0,
                clicks    INTEGER NOT NULL DEFAULT 0,
                api_calls INTEGER NOT NULL DEFAULT 0
            );
            INSERT OR IGNORE INTO stats (id) VALUES (1);
        ";
        cmd.ExecuteNonQuery();
        try
        {
            cmd.CommandText = "ALTER TABLE stats ADD COLUMN api_calls INTEGER NOT NULL DEFAULT 0";
            cmd.ExecuteNonQuery();
        }
        catch (SqliteException ex) when (ex.Message.Contains("duplicate column name"))
        {
            // expected on DBs already migrated
        }
    }

    public void IncrementAttempts() => Exec("UPDATE stats SET attempts  = attempts  + 1 WHERE id = 1");
    public void IncrementClicks()   => Exec("UPDATE stats SET clicks    = clicks    + 1 WHERE id = 1");
    public void IncrementApiCalls() => Exec("UPDATE stats SET api_calls = api_calls + 1 WHERE id = 1");

    public DbStats GetStats()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT attempts, clicks, api_calls FROM stats WHERE id = 1";
        using var r = cmd.ExecuteReader();
        return r.Read()
            ? new DbStats(r.GetInt64(0), r.GetInt64(1), r.GetInt64(2))
            : new DbStats(0, 0, 0);
    }

    private void Exec(string sql)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = sql;
        cmd.ExecuteNonQuery();
    }

    private static SqliteConnection Open()
    {
        var c = new SqliteConnection(ConnStr);
        c.Open();
        return c;
    }
}

public class VisitorTracker
{
    private int _count;
    public int Join()  => Interlocked.Increment(ref _count);
    public int Leave() => Math.Max(0, Interlocked.Decrement(ref _count));
    public int Count   => _count;
}
