using Microsoft.AspNetCore.SignalR;

public class NothingHub(VisitorTracker tracker, StatsDb db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var visitors = tracker.Join();
        var s = db.GetStats();
        await Clients.All.SendAsync("StatsUpdated",
            new { s.attempts, s.clicks, visitors, s.apiCalls });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        var visitors = tracker.Leave();
        var s = db.GetStats();
        await Clients.All.SendAsync("StatsUpdated",
            new { s.attempts, s.clicks, visitors, s.apiCalls });
        await base.OnDisconnectedAsync(ex);
    }
}
