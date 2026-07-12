namespace Backend.Dtos;

public record ResidenceRuleDto(
    string ResidenceRuleId,
    string Title,
    string Content,
    string RuleType,
    string ViolationLevel,
    decimal? DefaultPenaltyAmount,
    DateOnly EffectiveFrom);
