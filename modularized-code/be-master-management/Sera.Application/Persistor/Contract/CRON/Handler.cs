namespace Sera.Application.Persistor
{
    public class ContractStatusUpdaterHandler : BaseHandler,
                                                IRequestHandler<ContractStatusUpdaterRequest, IResultStatus>
    {
        public ContractStatusUpdaterHandler(IDbContext dbContext, IMessage message)
               : base(dbContext, message)
        { }

        public async Task<IResultStatus> Handle(ContractStatusUpdaterRequest request,
                                                CancellationToken cancellationToken)
        {
            ResultStatus result = new();

            //RETRIEVE CONTRACT
            var data = await dbContext.CustomerContract
                                      .Where(x => x.status == (int)EventStatus.COMPLETED &&
                                                  x.modifiedAt.Value.Date != DateTime.Now.Date &&
                                                  x.customerContractStatus != (int)ContractStatus.EXPIRED)
                                      .ToListAsync(cancellationToken);

            if (data.Count == 0)
            {
                return result.ReturnErrorStatus(Message.NotFound("Customer Contract"));
            }

            //INSERT INTO COSMOS EVENT HISTORY STATUS 1 VIA SERVICE BUS
            EventHistory sbusRequest = new()
            {
                _id = AppFunc.TimestampComposite(),
                transactionId = Guid.NewGuid().ToString(),
                method = HTTPMethod.PUT.ToString(),
                source = "FA - Master Customer Contract Status Updater",
                payload = data.Serialize(),
                status = (int)EventStatus.INPROGRESS,
                entity = "CustomerContract",
                userId = 0,
                date = DateTime.UtcNow,
                datePartition = DateTime.UtcNow.ToString("yyyy-MM-dd")
            };

            List<string> jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);
            
            data.ForEach(x =>
            {               
                #region NOT STARTED
                if (x.startDate.Date > DateTime.Now.Date) //Not Started
                {
                    x.customerContractStatus = (int)ContractStatus.NOT_STARTED;
                    x.modifiedBy = 0;
                    x.modifiedAt = DateTime.UtcNow;
                }
                #endregion

                #region ACTIVE
                if ((x.endDate.Date - DateTime.Now.Date).Days > CommonConst.MAX_EXP && x.startDate.Date <= DateTime.Now.Date) //Active
                {
                    x.customerContractStatus = (int)ContractStatus.ACTIVE;
                    x.modifiedBy = 0;
                    x.modifiedAt = DateTime.UtcNow;
                }
                #endregion

                #region EXPIRING IN
                if ((x.endDate.Date - DateTime.Now.Date).Days > 0 && (x.endDate.Date - DateTime.Now.Date).Days <= CommonConst.MAX_EXP) //Expiring SOON
                {
                    x.customerContractStatus = (int)ContractStatus.EXPIRING_SOON;
                    x.modifiedBy = 0;
                    x.modifiedAt = DateTime.UtcNow;
                }
                #endregion

                #region EXPIRED
                if (DateTime.Now.Date >= x.endDate.Date) //Expired
                {
                    x.customerContractStatus = (int)ContractStatus.EXPIRED;
                    x.modifiedBy = 0;
                    x.modifiedAt = DateTime.UtcNow;
                }
                #endregion
            });

            if (await dbContext.SaveChangesAsync(cancellationToken) <= 0)
            {
                return result.ReturnErrorStatus(Message.UpdateFail("Customer Contract"));
            }

            //INSERT INTO COSMOS EVENT HISTORY STATUS 2 VIA SERVICE BUS
            sbusRequest.status = (int)EventStatus.COMPLETED;
            jsonRequest = new() { sbusRequest.Serialize() };
            await message.SendMessageAsync(AppConst.MASTER_SERVICE_BUS_TOPIC_NAME,
                                           CommonConst.SERVICE_BUS_EVENT_SUBS_FILTER_NAME,
                                           jsonRequest);

            return result;
        }
    }
}
