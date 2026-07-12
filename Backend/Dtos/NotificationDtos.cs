namespace Backend.Dtos;

public record NotificationDto(string NotificationId, string Title, string Content, string NotificationType, DateTime CreatedAt, bool IsRead, DateTime? ReadAt);
public record NotificationListDto(int UnreadCount, List<NotificationDto> Items);
