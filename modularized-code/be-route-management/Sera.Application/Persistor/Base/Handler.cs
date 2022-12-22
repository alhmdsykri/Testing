namespace Sera.Application.Persistor
{
    [ExcludeFromCodeCoverage]
    public abstract class BaseHandler
    {
        protected readonly ICosmosContext cosmosContext;
        protected readonly IFirebaseContext firebaseContext;
        protected readonly IDbContext dbContext;
        protected readonly IMessage message;
        protected readonly IRESTClient client;
        protected readonly IRESTUserClient userclient;
        public BaseHandler(IDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public BaseHandler(ICosmosContext cosmosContext)
        {
            this.cosmosContext = cosmosContext;
        }

        public BaseHandler(IFirebaseContext firebaseContext)
        {
            this.firebaseContext = firebaseContext;
        }

        public BaseHandler(IFirebaseContext firebaseContext, IMessage message)
        {
            this.firebaseContext = firebaseContext;
            this.message = message;
        }

        public BaseHandler(IDbContext dbContext, IMessage message)
        {
            this.dbContext = dbContext;
            this.message = message;
        }

        public BaseHandler(IDbContext dbContext, IMessage message, IRESTClient client)
        {
            this.dbContext = dbContext;
            this.message = message;
            this.client = client;
        }
        public BaseHandler(IDbContext dbContext, IMessage message, IRESTUserClient userclient)
        {
            this.dbContext = dbContext;
            this.message = message;
            this.userclient = userclient;
        }
        public BaseHandler(IMessage message)
        {
            this.message = message;
        }
    }
}
