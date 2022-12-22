namespace Sera.Application.Usecase.Location.GetByMultipleId
{
    [ExcludeFromCodeCoverage]
    public class GetLocationByMultipleIdValidation : AbstractValidator<GetLocationByMultipleIdRequest>
    {
        public GetLocationByMultipleIdValidation()
        {
            RuleFor(x => x.locationId).ForEach(x => x.GreaterThan(0));
        }
    }
}
