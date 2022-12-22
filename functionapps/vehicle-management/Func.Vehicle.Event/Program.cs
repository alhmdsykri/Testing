var host = new HostBuilder().ConfigureFunctionsWorkerDefaults()
                            .ConfigureServices(s =>
                             {
                                 s.AddMediatR(typeof(LogErrorHandler).GetTypeInfo().Assembly);
                                 s.ConfigureInfrastructure();
                                 s.ConfigurePersistance();
                             }).Build();

host.Run();