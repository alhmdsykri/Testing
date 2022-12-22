namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateVendorContractValidation : AbstractValidator<CreateVendorContractRequest>
    {
        public CreateVendorContractValidation()
        {
            RuleFor(x => x.vendorId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.contract).NotEmpty();
        }
    }

    [ExcludeFromCodeCoverage]
    public class VendorContractValidation : AbstractValidator<VendorContractModel>
    {
        public VendorContractValidation()
        {
            List<string> contractType = new() { "01", "02", "03" };

            RuleFor(x => x.contractNumber).NotEmpty().MaximumLength(25);
            RuleFor(x => x.contractType).NotEmpty().MaximumLength(10)
                                        .Must(x => contractType.Contains(x))
                                        .WithMessage("Please only use: " + String.Join(",", contractType));
            RuleFor(x => x.startDate).NotEmpty().GreaterThanOrEqualTo(DateTime.Now.Date);
            RuleFor(x => x.endDate).NotEmpty().GreaterThan(x => x.startDate);
            RuleFor(x => x.businessUnitId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.businessUnitCode).NotEmpty().MaximumLength(4);
            RuleFor(x => x.businessUnitName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.companyId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.companyCode).NotEmpty().MaximumLength(4);
            RuleFor(x => x.companyName).NotEmpty().MaximumLength(100);
        }
    }
}
