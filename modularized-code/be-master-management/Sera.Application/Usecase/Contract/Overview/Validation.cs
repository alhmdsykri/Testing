namespace Sera.Application.Usecase.Contract.Overview
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewContractValidation : AbstractValidator<GetOverviewContractRequest>
    {
        public GetOverviewContractValidation()
        {
            RuleFor(x => x.businessUnitId).NotEmpty();
        }
    }
}