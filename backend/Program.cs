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

// ── ENDPOINTS ─────────────────────────────────────────────────────────────

app.MapPost("/api/attempt", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementAttempts();
    var (attempts, clicks) = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated", new { attempts, clicks, visitors = vt.Count });
    return Results.Ok();
});

app.MapPost("/api/click", async (IHubContext<NothingHub> hub, StatsDb db, VisitorTracker vt) =>
{
    db.IncrementClicks();
    var (attempts, clicks) = db.GetStats();
    await hub.Clients.All.SendAsync("StatsUpdated", new { attempts, clicks, visitors = vt.Count });
    return Results.Ok();
});

app.MapGet("/api/stats", (StatsDb db, VisitorTracker vt) =>
{
    var (attempts, clicks) = db.GetStats();
    return Results.Ok(new { attempts, clicks, visitors = vt.Count });
});

app.MapHub<NothingHub>("/hub/nothing");

// Serve React build in production
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();

// ── SERVICES ──────────────────────────────────────────────────────────────

public class StatsDb
{
    private const string ConnStr = "Data Source=nothing.db";

    public void Init()
    {
        using var conn = Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            CREATE TABLE IF NOT EXISTS stats (
                id       INTEGER PRIMARY KEY CHECK (id = 1),
                attempts INTEGER NOT NULL DEFAULT 0,
                clicks   INTEGER NOT NULL DEFAULT 0
            );
            INSERT OR IGNORE INTO stats (id) VALUES (1);
        ";
        cmd.ExecuteNonQuery();
    }

    public void IncrementAttempts() => Exec("UPDATE stats SET attempts = attempts + 1 WHERE id = 1");
    public void IncrementClicks()   => Exec("UPDATE stats SET clicks   = clicks   + 1 WHERE id = 1");

    public (long attempts, long clicks) GetStats()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT attempts, clicks FROM stats WHERE id = 1";
        using var r = cmd.ExecuteReader();
        return r.Read() ? (r.GetInt64(0), r.GetInt64(1)) : (0, 0);
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
