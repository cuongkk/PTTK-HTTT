using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public interface INotificationService
{
    Task<NotificationListDto> GetMineAsync(string accountId);
    Task MarkReadAsync(string accountId, string notificationId);
    Task MarkAllReadAsync(string accountId);
}

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    public NotificationService(AppDbContext db) => _db = db;

    public async Task<NotificationListDto> GetMineAsync(string accountId)
    {
        var items = await _db.Notifications.Where(x => x.RecipientAccountId == accountId).OrderByDescending(x => x.CreatedAt)
            .Select(x => new NotificationDto(x.NotificationId, x.Title, x.Content, x.NotificationType, x.CreatedAt, x.IsRead, x.ReadAt)).ToListAsync();
        return new NotificationListDto(items.Count(x => !x.IsRead), items);
    }

    public async Task MarkReadAsync(string accountId, string notificationId)
    {
        var item = await _db.Notifications.FirstOrDefaultAsync(x => x.NotificationId == notificationId && x.RecipientAccountId == accountId)
            ?? throw new NotFoundException("Không tìm thấy thông báo.");
        if (!item.IsRead) { item.IsRead = true; item.ReadAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }
    }

    public async Task MarkAllReadAsync(string accountId)
    {
        var items = await _db.Notifications.Where(x => x.RecipientAccountId == accountId && !x.IsRead).ToListAsync();
        var now = DateTime.UtcNow;
        foreach (var item in items) { item.IsRead = true; item.ReadAt = now; }
        await _db.SaveChangesAsync();
    }
}
