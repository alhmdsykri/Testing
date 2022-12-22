namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateContractValidation : AbstractValidator<UpdateContractRequest>
    {        
        public UpdateContractValidation()
        {
            RuleFor(x => x.contractId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.endDate).NotEmpty().GreaterThanOrEqualTo(x => x.startDate);
        }
    }
}
