namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleTypeValidation : AbstractValidator<GetVehicleTypeRequest>
    {
        public GetVehicleTypeValidation()
        {
            RuleFor(x => x.vehicleTypeId).NotEmpty();
        }
    }
}