namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleValidation : AbstractValidator<GetVehicleRequest>
    {
        public GetVehicleValidation()
        {
            RuleFor(x => x.vehicleId).NotEmpty();
        }
    }
}