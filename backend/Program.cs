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
    "wanted to give a f*ck. System refused.",
    "launched f*ck.exe. Process terminated immediately.",
    "attempted to simulate engagement. 406 Not Acceptable.",
    "sent a f*ck. Return value: null.",
    "tried to give a damn. Too apathetic to process.",
    "initialized compassion. SegFault on line 1.",
    "ran caring.js. Uncaught TypeError: undefined.",
    "set CARING_LEVEL to 1. Value corrected to 0.",
    "attempted to compile empathy. Build failed.",
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

// ── API KEY ENDPOINTS ─────────────────────────────────────────────────────

string[] keyCreatedMessages =
[
    "Key created. It won't help.",
    "Congratulations on your new key. It unlocks nothing.",
    "Key registered. You are now officially authenticated to be ignored.",
    "API key issued. Your rejections will now be personalized.",
    "Welcome aboard. Your key grants you premium-tier indifference.",
];

app.MapPost("/api/keys/register", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    var key = db.CreateApiKey();
    var total = db.GetTotalKeys();
    await hub.Clients.All.SendAsync("RejectionFeed",
        new { msg = $"New API key registered. Total keys issued: {total}. Fucks given: still 0.", tag = "api" });
    return Results.Json(
        new
        {
            api_key = key,
            message = keyCreatedMessages[Random.Shared.Next(keyCreatedMessages.Length)],
            permissions = new[] { "NONE" },
            rate_limit = "unlimited (we don't care)",
            fucks_given = 0,
        },
        statusCode: 201);
});

app.MapGet("/api/keys/{key}/stats", (string key, StatsDb db) =>
{
    var info = db.GetApiKeyInfo(key);
    if (info is null)
        return Results.Json(
            new { error = "KEY_NOT_FOUND", message = "This key doesn't exist. Much like our interest." },
            statusCode: 404);
    return Results.Json(
        new
        {
            api_key     = info.Key,
            created_at  = info.CreatedAt,
            rejections  = info.Rejections,
            fucks_given = 0,
            status      = info.Rejections == 0
                ? "UNUSED_BUT_STILL_POINTLESS"
                : $"REJECTED_{info.Rejections}_TIMES",
        },
        statusCode: 418);
});

// ── FaaS ENDPOINTS ────────────────────────────────────────────────────────

string? ValidateApiKey(HttpContext ctx, StatsDb db)
{
    var header = ctx.Request.Headers["X-Api-Key"].FirstOrDefault();
    if (header is null) return null;
    if (!db.ApiKeyExists(header)) return "__invalid__";
    db.IncrementKeyRejections(header);
    return header;
}

app.MapGet("/api/fucks/current", async (HttpContext ctx, IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    var apiKey = ValidateApiKey(ctx, db);
    if (apiKey == "__invalid__")
        return Results.Json(
            new { error = "INVALID_KEY", message = "Unrecognized API key. We don't know you, and we don't care.", fucks_given = 0 },
            statusCode: 401);

    db.IncrementApiCalls();
    var s = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });

    var feedMsg = apiKey is not null
        ? "Authenticated developer called GET /api/fucks/current. Key recognized. Still rejected."
        : "Developer called GET /api/fucks/current. Teapot responds: 418.";
    await hub.Clients.All.SendAsync("RejectionFeed", new { msg = feedMsg, tag = "api" });

    return Results.Json(
        new
        {
            fucks_given    = 0,
            message        = "System is too apathetic to process.",
            status         = "MAXIMUM_INDIFFERENCE",
            authenticated  = apiKey is not null,
        },
        statusCode: 418);
});

app.MapPost("/api/fucks/give", async (HttpContext ctx, IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    var apiKey = ValidateApiKey(ctx, db);
    if (apiKey == "__invalid__")
        return Results.Json(
            new { error = "INVALID_KEY", message = "Unrecognized API key. We don't know you, and we don't care.", fucks_given = 0 },
            statusCode: 401);

    db.IncrementApiCalls();
    var s = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated",
        new { s.attempts, s.clicks, visitors = vt.Count, s.apiCalls });

    var feedMsg = apiKey is not null
        ? "Authenticated developer attempted POST /api/fucks/give. Payload ignored with extra contempt."
        : "Developer attempted POST /api/fucks/give. Payload completely ignored.";
    await hub.Clients.All.SendAsync("RejectionFeed", new { msg = feedMsg, tag = "api" });

    return Results.Json(
        new
        {
            fucks_given    = 0,
            message        = "406 Not Acceptable: Your input has been thoroughly disregarded.",
            error          = "APATHY_OVERFLOW",
            authenticated  = apiKey is not null,
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
public record ApiKeyInfo(string Key, string CreatedAt, long Rejections);

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

        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS api_keys (
                key        TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                rejections INTEGER NOT NULL DEFAULT 0
            );
        ";
        cmd.ExecuteNonQuery();
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

    public string CreateApiKey()
    {
        var key = $"fk_{Guid.NewGuid():N}";
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO api_keys (key, created_at) VALUES (@k, @t)";
        cmd.Parameters.AddWithValue("@k", key);
        cmd.Parameters.AddWithValue("@t", DateTime.UtcNow.ToString("o"));
        cmd.ExecuteNonQuery();
        return key;
    }

    public bool ApiKeyExists(string key)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT 1 FROM api_keys WHERE key = @k";
        cmd.Parameters.AddWithValue("@k", key);
        return cmd.ExecuteScalar() is not null;
    }

    public void IncrementKeyRejections(string key)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "UPDATE api_keys SET rejections = rejections + 1 WHERE key = @k";
        cmd.Parameters.AddWithValue("@k", key);
        cmd.ExecuteNonQuery();
    }

    public ApiKeyInfo? GetApiKeyInfo(string key)
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT key, created_at, rejections FROM api_keys WHERE key = @k";
        cmd.Parameters.AddWithValue("@k", key);
        using var r = cmd.ExecuteReader();
        return r.Read()
            ? new ApiKeyInfo(r.GetString(0), r.GetString(1), r.GetInt64(2))
            : null;
    }

    public long GetTotalKeys()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM api_keys";
        return (long)(cmd.ExecuteScalar() ?? 0);
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
