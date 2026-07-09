using System.Text.Json;
using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;

namespace Backend.Services;

public class RoomCatalogService : IRoomCatalogService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IBranchRepository _branchRepository;
    private readonly IAdminAuditLogRepository _auditLogRepository;

    public RoomCatalogService(
        IRoomRepository roomRepository,
        IBranchRepository branchRepository,
        IAdminAuditLogRepository auditLogRepository)
    {
        _roomRepository = roomRepository;
        _branchRepository = branchRepository;
        _auditLogRepository = auditLogRepository;
    }

    public async Task<List<RoomDto>> GetAllAsync()
    {
        var rooms = await _roomRepository.GetAllWithDetailsAsync();
        return rooms.Select(ToDto).ToList();
    }

    public async Task<List<BranchDto>> GetBranchesAsync()
    {
        var branches = await _branchRepository.GetAllAsync();
        return branches.Select(b => new BranchDto(b.BranchId, b.BranchName, b.Address, b.PhoneNumber, b.Email)).ToList();
    }

    public async Task<RoomDto> CreateAsync(CreateRoomRequest request, string actorAccountId)
    {
        _ = await _branchRepository.GetByIdAsync(request.BranchId)
            ?? throw new ValidationException($"Chi nhánh '{request.BranchId}' không tồn tại.");

        var room = new Room
        {
            RoomId = IdGenerator.Generate("PH", 10),
            BranchId = request.BranchId,
            RoomName = request.RoomName,
            RoomType = request.RoomType,
            Capacity = request.Capacity,
            Area = request.Area,
            RoomPrice = request.RoomPrice,
            HasAirConditioner = request.HasAirConditioner,
            HasParking = request.HasParking,
            Status = RoomBedStatus.Empty,
            UpdatedAt = DateTime.UtcNow,
            UpdatedByAccountId = actorAccountId,
        };

        await _roomRepository.AddAsync(room);
        await _roomRepository.SaveChangesAsync();

        var created = await _roomRepository.GetByIdWithDetailsAsync(room.RoomId);
        var createdDto = ToDto(created!);
        await LogAsync(actorAccountId, AdminActionType.UpdateRoom, null, createdDto);
        await _roomRepository.SaveChangesAsync();

        return createdDto;
    }

    public async Task<RoomDto> UpdateAsync(string roomId, UpdateRoomRequest request, string actorAccountId)
    {
        var room = await _roomRepository.GetByIdWithDetailsAsync(roomId)
            ?? throw new NotFoundException($"Không tìm thấy phòng '{roomId}'.");

        var oldSnapshot = ToDto(room);

        room.RoomName = request.RoomName;
        room.RoomType = request.RoomType;
        room.Capacity = request.Capacity;
        room.Area = request.Area;
        room.RoomPrice = request.RoomPrice;
        room.HasAirConditioner = request.HasAirConditioner;
        room.HasParking = request.HasParking;
        room.Status = request.Status;
        room.UpdatedAt = DateTime.UtcNow;
        room.UpdatedByAccountId = actorAccountId;

        _roomRepository.Update(room);
        await LogAsync(actorAccountId, AdminActionType.UpdateRoom, oldSnapshot, room);
        await _roomRepository.SaveChangesAsync();

        return ToDto(room);
    }

    public async Task DeleteAsync(string roomId, string actorAccountId)
    {
        var room = await _roomRepository.GetByIdWithDetailsAsync(roomId)
            ?? throw new NotFoundException($"Không tìm thấy phòng '{roomId}'.");

        if (room.Beds.Count > 0)
        {
            throw new ConflictException("Không thể xóa phòng còn giường. Hãy xóa các giường trước.");
        }

        var oldSnapshot = ToDto(room);
        _roomRepository.Remove(room);
        await LogAsync(actorAccountId, AdminActionType.UpdateRoom, oldSnapshot, null);
        await _roomRepository.SaveChangesAsync();
    }

    private async Task LogAsync(string actorAccountId, string actionType, object? oldValue, object? newValue)
    {
        await _auditLogRepository.AddAsync(new AdminAuditLog
        {
            LogId = IdGenerator.Generate("NK", 12),
            ActorAccountId = actorAccountId,
            ActionType = actionType,
            OldValue = oldValue is null ? null : JsonSerializer.Serialize(oldValue, AuditJsonOptions.Default),
            NewValue = newValue is null ? null : JsonSerializer.Serialize(newValue, AuditJsonOptions.Default),
        });
    }

    private static RoomDto ToDto(Room room) => new(
        room.RoomId,
        room.BranchId,
        room.Branch?.BranchName ?? room.BranchId,
        room.RoomName,
        room.RoomType,
        room.Capacity,
        room.Area,
        room.RoomPrice,
        room.HasAirConditioner,
        room.HasParking,
        room.Status,
        room.Beds.Select(b => new BedDto(b.BedId, b.RoomId, b.BedNumber, b.MonthlyRent, b.Status)).ToList()
    );
}
