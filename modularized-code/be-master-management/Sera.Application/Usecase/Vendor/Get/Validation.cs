namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVendorValidation : AbstractValidator<GetVendorRequest>
    {
        public GetVendorValidation()
        {
            RuleFor(x => x.vendorId).NotEmpty();
        }
    }
}