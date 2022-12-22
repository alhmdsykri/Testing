using static Sera.Common.Function.AppFunc;

namespace Sera.Application.Usecase
{
    [ExcludeFromCodeCoverage]
    public class CreateLocationValidation : AbstractValidator<CreateLocationRequest>
    {
        /// <summary>
        /// LT CICO POOL CUSTOMER:
        ///     Required:
        ///         - locationName
        ///         - cicoPoolType
        ///         - businessUnitId
        ///         - branchId
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        ///         - customerId
        /// LT CICO POOL OFFICE:
        ///     Required:
        ///         - locationName
        ///         - cicoPoolType
        ///         - businessUnitId
        ///         - branchId
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        /// LT SUB POOL:
        ///     Required:
        ///         - locationName
        ///         - businessUnitId
        ///         - branchId
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        ///         - parentLocationId
        /// LT CHECK POINT:
        ///     Required:
        ///         - locationName
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        /// LT AD-HOC:
        ///     Required:
        ///         - locationName
        ///         - businessUnitId
        ///         - branchId
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        ///         - customerId
        ///         - customerContractId
        ///         - parentLocationId
        /// LT VENDOR:
        ///     Required:
        ///         - locationName
        ///         - businessUnitId
        ///         - branchId
        ///         - timeOffset
        ///         - latitude
        ///         - longitude
        ///         - address
        ///         - radius
        ///     Optional:
        ///         - workingHours
        ///         - vendorId
        /// </summary>
        public CreateLocationValidation()
        {
            RuleFor(x => x.locationTypeId).NotEmpty();
            RuleFor(x => x.locationName).NotEmpty()
                                        .MaximumLength(150)
                                        .Matches(CommonConst.REGEX_NAME)
                                        .WithMessage("Numbers, letters, space, point, dash and comma only please.");
            RuleFor(x => x.timeOffset).NotEmpty().GreaterThanOrEqualTo(7).LessThanOrEqualTo(9);
            RuleFor(x => x.latitude).NotEmpty().GreaterThanOrEqualTo(-90).LessThanOrEqualTo(90);
            RuleFor(x => x.longitude).NotEmpty().GreaterThanOrEqualTo(-180).LessThanOrEqualTo(180);
            RuleFor(x => x.locationAddress).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.radius).NotEmpty().LessThanOrEqualTo(500);
            When(x => x.workingHour != null, () =>
            {
                RuleFor(x => x.workingHour).NotEqual(string.Empty).MaximumLength(100);
            });

            When(x => x.locationTypeId == (int)LocationType.CICOPOOL, () =>
            {
                RuleFor(x => x.cicoPoolType).NotEmpty().GreaterThanOrEqualTo(1).LessThanOrEqualTo(2);
                RuleFor(x => x.businessUnitId).NotEmpty();
                RuleFor(x => x.businessUnitName).NotEmpty()
                                                .Must(CheckFieldMandatory.CheckBusinessUnitCode).WithMessage("please provide code and name in business unit name with dash(-) delimiter");
                RuleFor(x => x.branchId).NotEmpty();
                RuleFor(x => x.branchName).NotEmpty()
                                          .Must(CheckFieldMandatory.CheckBranchCode).WithMessage("please provide code and name in branch name with dash(-) delimiter");
            });

            When(x => x.locationTypeId == (int)LocationType.SUBPOOL ||
                      x.locationTypeId == (int)LocationType.ADHOC ||
                      x.locationTypeId == (int)LocationType.VENDOR, () =>
            {
                RuleFor(x => x.businessUnitId).NotEmpty();
                RuleFor(x => x.businessUnitName).NotEmpty()
                                                .Must(CheckFieldMandatory.CheckBusinessUnitCode).WithMessage("please provide code and name in business unit name with dash(-) delimiter");
                RuleFor(x => x.branchId).NotEmpty();
                RuleFor(x => x.branchName).NotEmpty()
                                          .Must(CheckFieldMandatory.CheckBranchCode).WithMessage("please provide code and name in branch name with dash(-) delimiter");
            });
        }
    }
}