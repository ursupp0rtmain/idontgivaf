using Microsoft.AspNetCore.SignalR;

public class NothingHub(VisitorTracker tracker, StatsDb db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var visitors = tracker.Join();
        var (attempts, clicks) = db.GetStats();
        await Clients.All.SendAsync("StatsUpdated", new { attempts, clicks, visitors });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        var visitors = tracker.Leave();
        var (attempts, clicks) = db.GetStats();
        await Clients.All.SendAsync("StatsUpdated", new { attempts, clicks, visitors });
        await base.OnDisconnectedAsync(ex);
    }
}
