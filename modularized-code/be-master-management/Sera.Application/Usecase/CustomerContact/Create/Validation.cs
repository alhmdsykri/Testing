namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateCustomerContactValidation : AbstractValidator<CreateCustomerContactRequest>
    {
        public CreateCustomerContactValidation()
        {
            RuleFor(x => x.customerId).NotEmpty();
            RuleFor(x => x.contactName).NotEmpty().MaximumLength(100)
                                       .Matches(CommonConst.REGEX_NAME)
                                       .WithMessage("Numbers, letters, space, point, dash and comma only please.");
            RuleFor(x => x.functionName).NotEmpty();
            RuleFor(x => x.phoneNumber).NotEmpty()
                                       .MaximumLength(20)
                                       .Matches(CommonConst.REGEX_NUMBER)
                                       .WithMessage("Numbers only please.");
            RuleFor(x => x.email).NotEmpty()
                                 .MaximumLength(50)
                                 .Matches(CommonConst.REGEX_EMAIL)
                                 .WithMessage("email format only please.");
        }
    }
}
