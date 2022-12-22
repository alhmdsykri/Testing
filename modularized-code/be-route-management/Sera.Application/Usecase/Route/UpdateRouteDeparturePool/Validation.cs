namespace Sera.Application.Usecase;

[ExcludeFromCodeCoverage]
public class UpdateRouteDeparturePoolValidation : AbstractValidator<UpdateRouteDeparturePoolRequest>
{
    public UpdateRouteDeparturePoolValidation()
    {
        RuleFor(x => x.routeId).NotEmpty();
        RuleFor(x => x.departurePoolId).NotEmpty();
        RuleFor(x => x.departurePoolCode).NotEmpty();
        RuleFor(x => x.departurePoolName).NotEmpty();
    }
}