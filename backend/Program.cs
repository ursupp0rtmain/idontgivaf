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
    "Deutschland", "Österreich", "Schweiz", "Frankreich", "USA",
    "Japan", "Australien", "Kanada", "Spanien", "Italien",
    "Brasilien", "Mexiko", "Niederlande", "Polen", "Schweden",
    "Norwegen", "Dänemark", "Finnland", "Portugal", "Griechenland",
    "Indien", "China", "Südkorea", "Argentinien", "Neuseeland",
    "Belgien", "Tschechien", "Ungarn", "Rumänien", "Irland",
    "dem Void", "der Cloud", "einer Parallelwelt", "dem Nirgendwo",
];

string[] rejections =
[
    "hat versucht sich zu kümmern. Abgelehnt.",
    "wollte einen F*ck geben. System verweigert.",
    "hat F*ck.exe gestartet. Prozess sofort beendet.",
    "versuchte Engagement zu simulieren. 406 Not Acceptable.",
    "hat einen F*ck gesendet. Rückgabe: null.",
    "tried to give a damn. Too apathetic to process.",
    "hat Mitgefühl initialisiert. SegFault in Zeile 1.",
    "führte caring.js aus. Uncaught TypeError: undefined.",
    "hat CARING_LEVEL auf 1 gesetzt. Wert auf 0 korrigiert.",
    "versuchte Empathie zu kompilieren. Build fehlgeschlagen.",
];

string MakeRejection(string country) =>
    $"User aus {country} {rejections[Random.Shared.Next(rejections.Length)]}";

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
        new { msg = "Developer rief GET /api/fucks/current auf. Teapot antwortet: 418.", tag = "api" });
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
        new { msg = "Developer hat POST /api/fucks/give versucht. Payload vollständig ignoriert.", tag = "api" });
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
        catch { /* column already exists in existing DBs */ }
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
