using Backend.Common;
using Backend.Dtos;
using Backend.Models;
using Backend.Repositories;
using Backend.Utilities;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class RoomCatalogService : IRoomCatalogService
{
    private readonly IRoomRepository _roomRepository;
    private readonly IBranchRepository _branchRepository;
    private readonly AppDbContext _db;

    public RoomCatalogService(IRoomRepository roomRepository, IBranchRepository branchRepository, AppDbContext db)
    {
        _roomRepository = roomRepository;
        _branchRepository = branchRepository;
        _db = db;
    }

    public async Task<List<ResidenceRuleDto>> GetResidenceRulesAsync(string roomId)
    {
        var branchId = await _db.Rooms.Where(x => x.RoomId == roomId).Select(x => x.BranchId).SingleOrDefaultAsync()
            ?? throw new NotFoundException($"Không tìm thấy phòng '{roomId}'.");
        var today = DateOnly.FromDateTime(DateTime.Today);
        return await _db.ResidenceRules.AsNoTracking()
            .Where(x => x.BranchId == branchId && x.Status == "hieu_luc" && x.EffectiveFrom <= today && (x.EffectiveTo == null || x.EffectiveTo >= today))
            .OrderBy(x => x.RuleType).ThenBy(x => x.ResidenceRuleId)
            .Select(x => new ResidenceRuleDto(x.ResidenceRuleId, x.Title, x.Content, x.RuleType, x.ViolationLevel, x.DefaultPenaltyAmount, x.EffectiveFrom))
            .ToListAsync();
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
            Floor = request.Floor,
            AreaSquareMeters = request.AreaSquareMeters,
            Description = request.Description,
            AllowedGender = request.AllowedGender,
            RequiresQuietLifestyle = request.RequiresQuietLifestyle,
            CurfewTime = request.CurfewTime,
            HasAirConditioner = request.HasAirConditioner,
            HasParking = request.HasParking,
            Status = RoomBedStatus.Empty,
            UpdatedAt = DateTime.UtcNow,
            UpdatedByAccountId = actorAccountId,
        };

        await _roomRepository.AddAsync(room);
        await _roomRepository.SaveChangesAsync();

        var created = await _roomRepository.GetByIdWithDetailsAsync(room.RoomId);
        return ToDto(created!);
    }

    public async Task<RoomDto> UpdateAsync(string roomId, UpdateRoomRequest request, string actorAccountId)
    {
        var room = await _roomRepository.GetByIdWithDetailsAsync(roomId)
            ?? throw new NotFoundException($"Không tìm thấy phòng '{roomId}'.");

        _ = await _branchRepository.GetByIdAsync(request.BranchId)
            ?? throw new ValidationException($"Chi nhánh '{request.BranchId}' không tồn tại.");

        room.BranchId = request.BranchId;
        room.RoomName = request.RoomName;
        room.RoomType = request.RoomType;
        room.Capacity = request.Capacity;
        room.Area = request.Area;
        room.RoomPrice = request.RoomPrice;
        room.Floor = request.Floor;
        room.AreaSquareMeters = request.AreaSquareMeters;
        room.Description = request.Description;
        room.AllowedGender = request.AllowedGender;
        room.RequiresQuietLifestyle = request.RequiresQuietLifestyle;
        room.CurfewTime = request.CurfewTime;
        room.HasAirConditioner = request.HasAirConditioner;
        room.HasParking = request.HasParking;
        room.Status = request.Status;
        room.UpdatedAt = DateTime.UtcNow;
        room.UpdatedByAccountId = actorAccountId;

        _roomRepository.Update(room);
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

        _roomRepository.Remove(room);
        await _roomRepository.SaveChangesAsync();
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
        room.Floor,
        room.AreaSquareMeters,
        room.Description,
        room.AllowedGender,
        room.RequiresQuietLifestyle,
        room.CurfewTime,
        room.HasAirConditioner,
        room.HasParking,
        room.Status,
        room.Beds.Select(b => new BedDto(b.BedId, b.RoomId, b.BedNumber, b.MonthlyRent, b.Status)).ToList(),
        room.Images.OrderBy(i => i.DisplayOrder).Select(i => new RoomImageDto(i.RoomImageId, i.ImageUrl, i.Description, i.DisplayOrder, i.IsPrimary)).ToList(),
        room.RoomAmenities.Where(ra => ra.Amenity.IsActive).Select(ra => new RoomAmenityDto(ra.AmenityId, ra.Amenity.AmenityName, ra.Quantity, ra.Note)).ToList()
    );
}
