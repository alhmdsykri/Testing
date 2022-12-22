namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class DeleteVehicleValidation : AbstractValidator<DeleteVehicleRequest>
    {
        public DeleteVehicleValidation()
        {
            RuleFor(x => x.vehicleId).NotEmpty();
        }
    }
}