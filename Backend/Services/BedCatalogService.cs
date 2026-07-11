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

    public BedCatalogService(IBedRepository bedRepository, IRoomRepository roomRepository)
    {
        _bedRepository = bedRepository;
        _roomRepository = roomRepository;
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
        await _bedRepository.SaveChangesAsync();

        return ToDto(bed);
    }

    public async Task<BedDto> UpdateAsync(string bedId, UpdateBedRequest request, string actorAccountId)
    {
        var bed = await _bedRepository.GetByIdAsync(bedId)
            ?? throw new NotFoundException($"Không tìm thấy giường '{bedId}'.");

        bed.BedNumber = request.BedNumber;
        bed.MonthlyRent = request.MonthlyRent;
        bed.Status = request.Status;
        bed.UpdatedAt = DateTime.UtcNow;
        bed.UpdatedByAccountId = actorAccountId;

        _bedRepository.Update(bed);
        await _bedRepository.SaveChangesAsync();

        return ToDto(bed);
    }

    public async Task DeleteAsync(string bedId, string actorAccountId)
    {
        var bed = await _bedRepository.GetByIdAsync(bedId)
            ?? throw new NotFoundException($"Không tìm thấy giường '{bedId}'.");

        _bedRepository.Remove(bed);
        await _bedRepository.SaveChangesAsync();
    }

    private static BedDto ToDto(Bed bed) => new(bed.BedId, bed.RoomId, bed.BedNumber, bed.MonthlyRent, bed.Status);
}
