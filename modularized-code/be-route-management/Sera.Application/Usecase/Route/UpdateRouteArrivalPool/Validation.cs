namespace Sera.Application.Usecase;

[ExcludeFromCodeCoverage]
public class UpdateRouteArrivalPoolValidation : AbstractValidator<UpdateRouteRouteArrivalPoolRequest>
{
    public UpdateRouteArrivalPoolValidation()
    {
        RuleFor(x => x.routeId).NotEmpty();
        RuleFor(x => x.arrivalPoolId).NotEmpty();
        RuleFor(x => x.arrivalPoolCode).NotEmpty();
        RuleFor(x => x.arrivalPoolName).NotEmpty();
    }
}