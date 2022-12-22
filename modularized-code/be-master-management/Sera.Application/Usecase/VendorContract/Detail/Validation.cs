namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorContractDetailValidation : AbstractValidator<GetVendorContractDetailRequest>
    {
        public GetVendorContractDetailValidation()
        {
            RuleFor(x => x.vendorContractId).NotEmpty();
        }
    }
}