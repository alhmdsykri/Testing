namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteVendorContractValidation : AbstractValidator<DeleteVendorContractRequest>
    {
        public DeleteVendorContractValidation()
        {
            RuleFor(x => x.vendorContractId).NotEmpty().GreaterThan(0);
        }
    }
}
