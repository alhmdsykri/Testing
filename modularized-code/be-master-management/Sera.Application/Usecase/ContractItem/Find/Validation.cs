namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class FindContractItemValidation : AbstractValidator<FindContractItemRequest>
    {
        public FindContractItemValidation()
        {
            RuleFor(x => x.contractId).NotEmpty();
        }
    }
}