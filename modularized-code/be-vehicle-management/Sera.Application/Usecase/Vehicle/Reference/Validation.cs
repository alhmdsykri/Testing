namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetVehicleReferenceValidation : AbstractValidator<GetVehicleReferenceRequest>
    {
        public GetVehicleReferenceValidation()
        {
            RuleFor(x => x.referenceName).NotEmpty().IsInEnum();
        }
    }
}