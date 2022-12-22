namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateContractItemValidation : AbstractValidator<CreateContractItemRequest>
    {
        public CreateContractItemValidation()
        {
            RuleFor(x => x.contractId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.contractItem).NotEmpty();
        }
    }

    [ExcludeFromCodeCoverage]
    public class ContractItemValidation : AbstractValidator<ContractItemModel>
    {
        public ContractItemValidation()
        {
            List<string> fuel = new() { "01", "02"};
            List<string> tollAndParking = new() { "01", "02"};

            RuleFor(x => x.materialId).NotEmpty().GreaterThan(0);
            RuleFor(x => x.materialCode).NotEmpty();
            RuleFor(x => x.quantity).NotEmpty().GreaterThan(0);
            RuleFor(x => x.UOMCode).NotEmpty();
            RuleFor(x => x.numberOfDriver).GreaterThanOrEqualTo(0).LessThanOrEqualTo(2);
            RuleFor(x => x.fuel).NotEmpty().MaximumLength(10)
                                .Must(x => fuel.Contains(x))
                                .WithMessage("Please only use: " + string.Join(",", fuel));
            RuleFor(x => x.tollAndParking).NotEmpty().MaximumLength(10)
                                          .Must(x => tollAndParking.Contains(x))
                                          .WithMessage("Please only use: " + string.Join(",", tollAndParking));
        }
    }
}
