namespace Backend.Utilities;

public static class IdGenerator
{
    /// <summary>
    /// Generates a fixed-length id like "TK0AB12CD345" (prefix + random alphanumeric, uppercase).
    /// </summary>
    public static string Generate(string prefix, int totalLength)
    {
        var randomPart = Guid.NewGuid().ToString("N").ToUpperInvariant();
        var available = totalLength - prefix.Length;
        if (available <= 0)
        {
            return prefix[..totalLength];
        }

        return prefix + randomPart[..available];
    }
}
