using System.Text.Json;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;

namespace Backend.Services;

public class BedCatalogService : IBedCatalogService
{
    private readonly IBedRepository _bedRepository;
    private readonly IRoomRepository _roomRepository;
    private readonly IAdminAuditLogRepository _auditLogRepository;

    public BedCatalogService(
        IBedRepository bedRepository,
        IRoomRepository roomRepository,
        IAdminAuditLogRepository auditLogRepository)
    {
        _bedRepository = bedRepository;
        _roomRepository = roomRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<List<BedDto>> GetByRoomIdAsync(string roomId)
    {
        var beds = await _bedRepository.GetByRoomIdAsync(roomId);
        return beds.Select(ToDto).ToList();
    }

    public async Task<BedDto> CreateAsync(CreateBedRequest request, string actorAccountId)
    {
        _ = await _roomRepository.GetByIdAsync(request.RoomId)
            ?? throw new ValidationException($"Phòng '{request.RoomId}' không tồn tại.");

        var existing = await _bedRepository.GetByRoomIdAsync(request.RoomId);
        if (existing.Any(b => b.BedNumber == request.BedNumber))
        {
            throw new ConflictException($"Giường số {request.BedNumber} đã tồn tại trong phòng này.");
        }

        var bed = new Bed
        {
            BedId = IdGenerator.Generate("GI", 12),
            RoomId = request.RoomId,
            BedNumber = request.BedNumber,
            MonthlyRent = request.MonthlyRent,
            Status = RoomBedStatus.Empty,
            UpdatedAt = DateTime.UtcNow,
            UpdatedByAccountId = actorAccountId,
        };

        await _bedRepository.AddAsync(bed);
        await LogAsync(actorAccountId, null, ToDto(bed));
        await _bedRepository.SaveChangesAsync();

        return ToDto(bed);
    }

    public async Task<BedDto> UpdateAsync(string bedId, UpdateBedRequest request, string actorAccountId)
    {
        var bed = await _bedRepository.GetByIdAsync(bedId)
            ?? throw new NotFoundException($"Không tìm thấy giường '{bedId}'.");

        var oldSnapshot = ToDto(bed);

        bed.BedNumber = request.BedNumber;
        bed.MonthlyRent = request.MonthlyRent;
        bed.Status = request.Status;
        bed.UpdatedAt = DateTime.UtcNow;
        bed.UpdatedByAccountId = actorAccountId;

        _bedRepository.Update(bed);
        await LogAsync(actorAccountId, oldSnapshot, bed);
        await _bedRepository.SaveChangesAsync();

        return ToDto(bed);
    }

    public async Task DeleteAsync(string bedId, string actorAccountId)
    {
        var bed = await _bedRepository.GetByIdAsync(bedId)
            ?? throw new NotFoundException($"Không tìm thấy giường '{bedId}'.");

        var oldSnapshot = ToDto(bed);
        _bedRepository.Remove(bed);
        await LogAsync(actorAccountId, oldSnapshot, null);
        await _bedRepository.SaveChangesAsync();
    }

    private async Task LogAsync(string actorAccountId, object? oldValue, object? newValue)
    {
        await _auditLogRepository.AddAsync(new AdminAuditLog
        {
            LogId = IdGenerator.Generate("NK", 12),
            ActorAccountId = actorAccountId,
            ActionType = AdminActionType.UpdateBed,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue, AuditJsonOptions.Default),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue, AuditJsonOptions.Default),
        });
    }

    private static BedDto ToDto(Bed bed) => new(bed.BedId, bed.RoomId, bed.BedNumber, bed.MonthlyRent, bed.Status);
}
