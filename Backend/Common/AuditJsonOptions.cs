using System.Text.Json;
using System.Text.Json.Serialization;

namespace Backend.Common;

public static class AuditJsonOptions
{
    /// <summary>
    /// Used only when serializing audit-log snapshots. Snapshots should already be plain DTOs,
    /// but IgnoreCycles is kept as a safety net against accidentally passing a tracked EF entity.
    /// </summary>
    public static readonly JsonSerializerOptions Default = new()
    {
        ReferenceHandler = ReferenceHandler.IgnoreCycles,
    };
}
