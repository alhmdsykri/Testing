namespace Sera.Application.Usecase.Contract.Overview
{
    [ExcludeFromCodeCoverage]
    public class GetContractItemValidation : AbstractValidator<GetContractItemRequest>
    {
        public GetContractItemValidation()
        {
            RuleFor(x => x.contractId).NotEmpty();
            RuleFor(x => x.contractItemId).NotEmpty();
        }
    }
}