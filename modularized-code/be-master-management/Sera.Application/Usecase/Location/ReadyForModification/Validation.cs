namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class ReadyForModificationValidation : AbstractValidator<LocationReadyForModificationRequest>
    {
        public ReadyForModificationValidation()
        {
            RuleFor(x => x.locationId).NotEmpty();
        }
    }
}