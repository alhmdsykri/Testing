namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class GetCustomerValidation : AbstractValidator<GetCustomerRequest>
    {
        public GetCustomerValidation()
        {
            RuleFor(x => x.customerId).NotEmpty();
        }
    }
}