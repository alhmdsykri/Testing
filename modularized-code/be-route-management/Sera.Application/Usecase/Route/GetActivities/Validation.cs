namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetRouteActivitiesValidation : AbstractValidator<GetRouteActivitiesRequest>
    {
        public GetRouteActivitiesValidation()
        {
            RuleFor(x => x.routeId).NotEmpty();
        }
    }
}