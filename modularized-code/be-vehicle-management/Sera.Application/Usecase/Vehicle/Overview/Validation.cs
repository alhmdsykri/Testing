namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetOverviewVehicleValidation : AbstractValidator<GetOverviewVehicleRequest>
    {
        public GetOverviewVehicleValidation()
        {
            RuleFor(x => x.vehicleTypeId).NotEmpty().GreaterThan(0);
        }
    }
}
