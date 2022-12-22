namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractValidation : AbstractValidator<GetVendorContractRequest>
    {
        public GetVendorContractValidation()
        {
            RuleFor(x => x.vendorId).NotEmpty();
        }
    }
}