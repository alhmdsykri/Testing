namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class UpdateRouteLocationActivitiesValidation : AbstractValidator<UpdateRouteLocationActivitiesRequest>
    {
        public UpdateRouteLocationActivitiesValidation()
        {
            RuleFor(x => x.routeLocationId).NotEmpty();
            RuleFor(x => x.routeActionId).NotEmpty();
            RuleFor(x => x.distanceToNextLocation).NotEmpty().GreaterThan(0);
        }
    }
}