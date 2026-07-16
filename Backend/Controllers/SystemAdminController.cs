using Backend.Common;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/system-admin")]
[Authorize(Roles = EmployeePosition.SystemAdmin)]
public class SystemAdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public SystemAdminController(AppDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        var result = new AdminDashboardDto(
            await _db.Accounts.CountAsync(),
            await _db.Accounts.CountAsync(x => x.Status == AccountStatus.Active),
            await _db.SystemRoles.CountAsync(),
            await _db.Permissions.CountAsync(),
            await _db.Rooms.CountAsync(),
            await _db.Rooms.CountAsync(x => x.Status == RoomBedStatus.Empty),
            await _db.Rooms.CountAsync(x => x.Status == RoomBedStatus.Rented),
            await _db.Beds.CountAsync(),
            await _db.Beds.CountAsync(x => x.Status == RoomBedStatus.Empty),
            await _db.Services.CountAsync(),
            await _db.Services.CountAsync(x => x.IsActive),
            await _db.SystemParameters.CountAsync(x => x.IsActive),
            await _db.ResidenceRules.CountAsync(x => x.Status == "hieu_luc")
        );
        return Ok(result);
    }

    [HttpGet("access-matrix")]
    public async Task<ActionResult<AccessMatrixDto>> GetAccessMatrix()
    {
        var permissions = await _db.Permissions.AsNoTracking().OrderBy(x => x.PermissionName)
            .Select(x => new PermissionDto(x.PermissionId, x.PermissionName, x.Description)).ToListAsync();
        var roles = await _db.SystemRoles.AsNoTracking().OrderBy(x => x.RoleName)
            .Select(x => new RoleAccessDto(
                x.RoleId,
                x.RoleName,
                x.Description,
                x.Accounts.Count,
                x.RolePermissions.OrderBy(rp => rp.PermissionId).Select(rp => rp.PermissionId).ToList()
            )).ToListAsync();
        return Ok(new AccessMatrixDto(roles, permissions));
    }

    [HttpPut("roles/{roleId}/permissions")]
    public async Task<ActionResult<RoleAccessDto>> UpdateRolePermissions(string roleId, UpdateRolePermissionsRequest request)
    {
        var role = await _db.SystemRoles.Include(x => x.RolePermissions).Include(x => x.Accounts)
            .SingleOrDefaultAsync(x => x.RoleId == roleId)
            ?? throw new NotFoundException("Không tìm thấy vai trò.");

        var requestedIds = request.PermissionIds.Distinct().ToList();
        var existingIds = await _db.Permissions.Where(x => requestedIds.Contains(x.PermissionId)).Select(x => x.PermissionId).ToListAsync();
        if (existingIds.Count != requestedIds.Count) throw new ValidationException("Danh sách quyền có quyền không tồn tại.");

        _db.RolePermissions.RemoveRange(role.RolePermissions);
        foreach (var permissionId in requestedIds)
            _db.RolePermissions.Add(new RolePermission { RoleId = roleId, PermissionId = permissionId });
        await _db.SaveChangesAsync();

        return Ok(new RoleAccessDto(role.RoleId, role.RoleName, role.Description, role.Accounts.Count, requestedIds));
    }

    [HttpGet("residence-rules")]
    public async Task<ActionResult<List<AdminResidenceRuleDto>>> GetResidenceRules() => Ok(await _db.ResidenceRules.AsNoTracking()
        .Join(_db.Branches, r => r.BranchId, b => b.BranchId, (r, b) => new { Rule = r, Branch = b })
        .OrderBy(x => x.Branch.BranchName).ThenBy(x => x.Rule.Title)
        .Select(x => new AdminResidenceRuleDto(
            x.Rule.ResidenceRuleId, x.Rule.BranchId, x.Branch.BranchName, x.Rule.Title, x.Rule.Content, x.Rule.RuleType,
            x.Rule.ViolationLevel, x.Rule.DefaultPenaltyAmount, x.Rule.EffectiveFrom, x.Rule.EffectiveTo, x.Rule.Status))
        .ToListAsync());

    [HttpPost("residence-rules")]
    public async Task<ActionResult<AdminResidenceRuleDto>> CreateResidenceRule(SaveResidenceRuleRequest request)
    {
        var branch = await _db.Branches.FindAsync(request.BranchId) ?? throw new NotFoundException("Không tìm thấy chi nhánh.");
        var rule = new ResidenceRule { ResidenceRuleId = IdGenerator.Generate("NQ", 12) };
        ApplyResidenceRule(rule, request);
        _db.ResidenceRules.Add(rule);
        await _db.SaveChangesAsync();
        return Ok(ToResidenceRuleDto(rule, branch.BranchName));
    }

    [HttpPut("residence-rules/{ruleId}")]
    public async Task<ActionResult<AdminResidenceRuleDto>> UpdateResidenceRule(string ruleId, SaveResidenceRuleRequest request)
    {
        var rule = await _db.ResidenceRules.FindAsync(ruleId) ?? throw new NotFoundException("Không tìm thấy nội quy.");
        var branch = await _db.Branches.FindAsync(request.BranchId) ?? throw new NotFoundException("Không tìm thấy chi nhánh.");
        ApplyResidenceRule(rule, request);
        rule.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToResidenceRuleDto(rule, branch.BranchName));
    }

    [HttpGet("amenities")]
    public async Task<ActionResult<List<AdminAmenityDto>>> GetAmenities() => Ok(await _db.Amenities.AsNoTracking()
        .OrderBy(x => x.AmenityName)
        .Select(x => new AdminAmenityDto(x.AmenityId, x.AmenityName, x.Description, x.IsActive, x.RoomAmenities.Count)).ToListAsync());

    [HttpPost("amenities")]
    public async Task<ActionResult<AdminAmenityDto>> CreateAmenity(SaveAmenityRequest request)
    {
        if (await _db.Amenities.AnyAsync(x => x.AmenityName == request.AmenityName)) throw new ConflictException("Tên tiện nghi đã tồn tại.");
        var amenity = new Amenity { AmenityId = IdGenerator.Generate("TN", 20) };
        ApplyAmenity(amenity, request);
        _db.Amenities.Add(amenity);
        await _db.SaveChangesAsync();
        return Ok(new AdminAmenityDto(amenity.AmenityId, amenity.AmenityName, amenity.Description, amenity.IsActive, 0));
    }

    [HttpPut("amenities/{amenityId}")]
    public async Task<ActionResult<AdminAmenityDto>> UpdateAmenity(string amenityId, SaveAmenityRequest request)
    {
        var amenity = await _db.Amenities.Include(x => x.RoomAmenities).SingleOrDefaultAsync(x => x.AmenityId == amenityId)
            ?? throw new NotFoundException("Không tìm thấy tiện nghi.");
        if (await _db.Amenities.AnyAsync(x => x.AmenityName == request.AmenityName && x.AmenityId != amenityId)) throw new ConflictException("Tên tiện nghi đã tồn tại.");
        ApplyAmenity(amenity, request);
        await _db.SaveChangesAsync();
        return Ok(new AdminAmenityDto(amenity.AmenityId, amenity.AmenityName, amenity.Description, amenity.IsActive, amenity.RoomAmenities.Count));
    }

    [HttpGet("rooms/{roomId}/amenities")]
    public async Task<ActionResult<List<RoomAmenityAdminDto>>> GetRoomAmenities(string roomId) => Ok(await _db.RoomAmenities.AsNoTracking()
        .Where(x => x.RoomId == roomId)
        .OrderBy(x => x.Amenity.AmenityName)
        .Select(x => new RoomAmenityAdminDto(x.RoomId, x.Room.RoomName, x.AmenityId, x.Amenity.AmenityName, x.Quantity, x.Note))
        .ToListAsync());

    [HttpPut("rooms/{roomId}/amenities")]
    public async Task<ActionResult> SaveRoomAmenity(string roomId, SaveRoomAmenityRequest request)
    {
        if (!await _db.Rooms.AnyAsync(x => x.RoomId == roomId)) throw new NotFoundException("Không tìm thấy phòng.");
        if (!await _db.Amenities.AnyAsync(x => x.AmenityId == request.AmenityId)) throw new NotFoundException("Không tìm thấy tiện nghi.");
        var item = await _db.RoomAmenities.FindAsync(roomId, request.AmenityId);
        if (item is null)
            _db.RoomAmenities.Add(new RoomAmenity { RoomId = roomId, AmenityId = request.AmenityId, Quantity = request.Quantity, Note = request.Note });
        else { item.Quantity = request.Quantity; item.Note = request.Note; }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("rooms/{roomId}/amenities/{amenityId}")]
    public async Task<IActionResult> RemoveRoomAmenity(string roomId, string amenityId)
    {
        var item = await _db.RoomAmenities.FindAsync(roomId, amenityId) ?? throw new NotFoundException("Phòng chưa có tiện nghi này.");
        _db.RoomAmenities.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("room-images")]
    public async Task<ActionResult<List<AdminRoomImageDto>>> GetRoomImages([FromQuery] string? roomId) => Ok(await _db.RoomImages.AsNoTracking()
        .Where(x => roomId == null || x.RoomId == roomId)
        .OrderBy(x => x.Room.RoomName).ThenBy(x => x.DisplayOrder)
        .Select(x => new AdminRoomImageDto(x.RoomImageId, x.RoomId, x.Room.RoomName, x.ImageUrl, x.Description, x.DisplayOrder, x.IsPrimary)).ToListAsync());

    [HttpPost("rooms/{roomId}/images")]
    public async Task<ActionResult<AdminRoomImageDto>> CreateRoomImage(string roomId, SaveRoomImageRequest request)
    {
        var room = await _db.Rooms.FindAsync(roomId) ?? throw new NotFoundException("Không tìm thấy phòng.");
        if (request.IsPrimary) await ClearPrimaryRoomImage(roomId, null);
        var image = new RoomImage { RoomImageId = IdGenerator.Generate("HA", 12), RoomId = roomId };
        ApplyRoomImage(image, request);
        _db.RoomImages.Add(image);
        await _db.SaveChangesAsync();
        return Ok(ToRoomImageDto(image, room.RoomName));
    }

    [HttpPut("room-images/{imageId}")]
    public async Task<ActionResult<AdminRoomImageDto>> UpdateRoomImage(string imageId, SaveRoomImageRequest request)
    {
        var image = await _db.RoomImages.Include(x => x.Room).SingleOrDefaultAsync(x => x.RoomImageId == imageId)
            ?? throw new NotFoundException("Không tìm thấy ảnh phòng.");
        if (request.IsPrimary) await ClearPrimaryRoomImage(image.RoomId, imageId);
        ApplyRoomImage(image, request);
        await _db.SaveChangesAsync();
        return Ok(ToRoomImageDto(image, image.Room.RoomName));
    }

    [HttpDelete("room-images/{imageId}")]
    public async Task<IActionResult> DeleteRoomImage(string imageId)
    {
        var image = await _db.RoomImages.FindAsync(imageId) ?? throw new NotFoundException("Không tìm thấy ảnh phòng.");
        _db.RoomImages.Remove(image);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("service-rates")]
    public async Task<ActionResult<List<AdminServiceRateDto>>> GetServiceRates() => Ok(await _db.ServiceRates.AsNoTracking()
        .OrderBy(x => x.Service.ServiceName)
        .Select(x => new AdminServiceRateDto(
            x.ServiceRateId, x.ServiceId, x.Service.ServiceName,
            x.RoomId != null ? "phong" : "chi_nhanh",
            x.RoomId ?? x.BranchId!,
            x.RoomId != null ? x.Room!.RoomName : x.Branch!.BranchName,
            x.UnitPrice, x.IsActive)).ToListAsync());

    [HttpPost("service-rates")]
    public async Task<ActionResult<AdminServiceRateDto>> CreateServiceRate(SaveServiceRateRequest request)
    {
        var rate = new ServiceRate { ServiceRateId = IdGenerator.Generate("GDV", 12) };
        await ApplyServiceRate(rate, request, null);
        _db.ServiceRates.Add(rate);
        await _db.SaveChangesAsync();
        return Ok(await ToServiceRateDto(rate.ServiceRateId));
    }

    [HttpPut("service-rates/{rateId}")]
    public async Task<ActionResult<AdminServiceRateDto>> UpdateServiceRate(string rateId, SaveServiceRateRequest request)
    {
        var rate = await _db.ServiceRates.FindAsync(rateId) ?? throw new NotFoundException("Không tìm thấy giá dịch vụ áp dụng.");
        await ApplyServiceRate(rate, request, rateId);
        await _db.SaveChangesAsync();
        return Ok(await ToServiceRateDto(rate.ServiceRateId));
    }

    [HttpDelete("service-rates/{rateId}")]
    public async Task<IActionResult> DeleteServiceRate(string rateId)
    {
        var rate = await _db.ServiceRates.FindAsync(rateId) ?? throw new NotFoundException("Không tìm thấy giá dịch vụ áp dụng.");
        _db.ServiceRates.Remove(rate);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyResidenceRule(ResidenceRule rule, SaveResidenceRuleRequest request)
    {
        rule.BranchId = request.BranchId; rule.Title = request.Title.Trim(); rule.Content = request.Content.Trim();
        rule.RuleType = request.RuleType; rule.ViolationLevel = request.ViolationLevel;
        rule.DefaultPenaltyAmount = request.DefaultPenaltyAmount; rule.EffectiveFrom = request.EffectiveFrom;
        rule.EffectiveTo = request.EffectiveTo; rule.Status = request.Status;
    }
    private static AdminResidenceRuleDto ToResidenceRuleDto(ResidenceRule x, string branchName) => new(x.ResidenceRuleId, x.BranchId, branchName, x.Title, x.Content, x.RuleType, x.ViolationLevel, x.DefaultPenaltyAmount, x.EffectiveFrom, x.EffectiveTo, x.Status);
    private static void ApplyAmenity(Amenity x, SaveAmenityRequest request) { x.AmenityName = request.AmenityName.Trim(); x.Description = request.Description?.Trim(); x.IsActive = request.IsActive; }
    private static void ApplyRoomImage(RoomImage x, SaveRoomImageRequest request) { x.ImageUrl = request.ImageUrl.Trim(); x.Description = request.Description?.Trim(); x.DisplayOrder = request.DisplayOrder; x.IsPrimary = request.IsPrimary; }
    private static AdminRoomImageDto ToRoomImageDto(RoomImage x, string roomName) => new(x.RoomImageId, x.RoomId, roomName, x.ImageUrl, x.Description, x.DisplayOrder, x.IsPrimary);
    private async Task ClearPrimaryRoomImage(string roomId, string? exceptId) => await _db.RoomImages.Where(x => x.RoomId == roomId && x.IsPrimary && x.RoomImageId != exceptId).ExecuteUpdateAsync(x => x.SetProperty(i => i.IsPrimary, false));

    private async Task ApplyServiceRate(ServiceRate rate, SaveServiceRateRequest request, string? exceptId)
    {
        if (!await _db.Services.AnyAsync(x => x.ServiceId == request.ServiceId)) throw new NotFoundException("Không tìm thấy dịch vụ.");
        rate.ServiceId = request.ServiceId; rate.UnitPrice = request.UnitPrice; rate.IsActive = request.IsActive;
        if (request.ScopeType == "phong")
        {
            if (!await _db.Rooms.AnyAsync(x => x.RoomId == request.TargetId)) throw new NotFoundException("Không tìm thấy phòng.");
            if (await _db.ServiceRates.AnyAsync(x => x.ServiceId == request.ServiceId && x.RoomId == request.TargetId && x.ServiceRateId != exceptId)) throw new ConflictException("Dịch vụ đã có giá riêng cho phòng này.");
            rate.RoomId = request.TargetId; rate.BranchId = null;
        }
        else if (request.ScopeType == "chi_nhanh")
        {
            if (!await _db.Branches.AnyAsync(x => x.BranchId == request.TargetId)) throw new NotFoundException("Không tìm thấy chi nhánh.");
            if (await _db.ServiceRates.AnyAsync(x => x.ServiceId == request.ServiceId && x.BranchId == request.TargetId && x.ServiceRateId != exceptId)) throw new ConflictException("Dịch vụ đã có giá riêng cho chi nhánh này.");
            rate.BranchId = request.TargetId; rate.RoomId = null;
        }
        else throw new ValidationException("Phạm vi giá dịch vụ phải là chi_nhanh hoặc phong.");
    }

    private async Task<AdminServiceRateDto> ToServiceRateDto(string rateId) => await _db.ServiceRates.AsNoTracking().Where(x => x.ServiceRateId == rateId)
        .Select(x => new AdminServiceRateDto(x.ServiceRateId, x.ServiceId, x.Service.ServiceName, x.RoomId != null ? "phong" : "chi_nhanh", x.RoomId ?? x.BranchId!, x.RoomId != null ? x.Room!.RoomName : x.Branch!.BranchName, x.UnitPrice, x.IsActive)).SingleAsync();
}
