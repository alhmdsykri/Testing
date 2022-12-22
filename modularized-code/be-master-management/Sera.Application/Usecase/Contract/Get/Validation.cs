namespace Sera.Application.Usecase.Contract.Overview
{
    [ExcludeFromCodeCoverage]
    public class GetContractValidation : AbstractValidator<GetContractRequest>
    {
        public GetContractValidation()
        {
            RuleFor(x => x.contractId).NotEmpty();
        }
    }
}