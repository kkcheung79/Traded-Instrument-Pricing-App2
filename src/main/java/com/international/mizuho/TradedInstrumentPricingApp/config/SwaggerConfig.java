package com.international.mizuho.TradedInstrumentPricingApp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.international.mizuho.TradedInstrumentPricingApp.controller"))
                .paths(PathSelectors.ant("/api/**"))
                .build()
                .apiInfo(metaData());
    }

    private ApiInfo metaData() {
        return new ApiInfoBuilder()
                .title("Traded Instrument Pricing API")
                .description("A number of vendors provide price information for traded instruments; a traded instrument will have different prices from different vendors. Price data from each vendor is to be cached in a local data store and then distributed to interested downstream systems. The cache will have services to allow clients to publish and retrieve data from the store. Clients are interested in getting all prices from a particular vendor or prices for a single instrument from various vendors. Prices older than 30 days must be removed from the cache. ")
                .version("0.0.1-SNAPSHOT")
                .license("Apache License Version 2.0")
                .licenseUrl("https://www.apache.org/licenses/LICENSE-2.0\"")
                .contact(new Contact("Ken Cheung",
                        "https://www.linkedin.com/in/ken-cheung-263797104/",
                        "kkcheung79@gmail.com"))
                .build();
    }
}

