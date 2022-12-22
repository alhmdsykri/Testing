namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetTripExpenseCategoryValidation : AbstractValidator<GetTripExpenseCategoryRequest>
    {
        public GetTripExpenseCategoryValidation()
        {
            RuleFor(x => x.productId).NotEmpty();
        }
    }
}