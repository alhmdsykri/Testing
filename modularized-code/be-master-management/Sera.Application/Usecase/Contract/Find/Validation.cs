namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractValidation : AbstractValidator<FindContractsRequest>
    {
        public FindContractValidation()
        {
            RuleFor(x => x.businessUnitId).NotEmpty();
            When(x => x.startDate.HasValue, () => { RuleFor(x => x.endDate).NotEmpty(); });
            When(x => x.endDate.HasValue, () => { RuleFor(x => x.startDate).NotEmpty(); });
            When(x => x.startDate.HasValue && x.endDate.HasValue, () => { RuleFor(x => x.endDate).GreaterThan(x => x.startDate); });
        }
    }
}