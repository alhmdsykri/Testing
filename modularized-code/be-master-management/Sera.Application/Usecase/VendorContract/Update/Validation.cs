namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateVendorContractValidation : AbstractValidator<UpdateVendorContractRequest>
    {        
        public UpdateVendorContractValidation()
        {
            RuleFor(x => x.vendorContractId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.contractNumber).NotEmpty().MaximumLength(25);
            RuleFor(x => x.startDate).NotEmpty();
            RuleFor(x => x.endDate).NotEmpty();
        }
    }
}
