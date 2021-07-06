package com.international.mizuho.TradedInstrumentPricingApp.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * TradedInstrumentPricingAspect handle logging
 *
 * @author Ken Cheung
 * @version 1.0
 * @since 2021-07-05
 */
@Aspect
@Component
public class TradedInstrumentPricingAspect {

    private final Logger LOGGER = LoggerFactory.getLogger(TradedInstrumentPricingAspect.class);

    // setup pointcut declarations
    @Pointcut("execution(* com.international.mizuho.TradedInstrumentPricingApp.controller.*.*(..))")
    private void forControllerPackage() {
    }

    // do the same for service and dao
    @Pointcut("execution(* com.international.mizuho.TradedInstrumentPricingApp.service.*.*(..))")
    private void forServicePackage() {
    }

    @Pointcut("execution(* com.international.mizuho.TradedInstrumentPricingApp.util.*.*(..))")
    private void forUtilPackage() {
    }

    @Pointcut("execution(* com.international.mizuho.TradedInstrumentPricingApp.datacache.*.*(..))")
    private void forDataCachePackage() {
    }

    @Pointcut("execution(* com.international.mizuho.TradedInstrumentPricingApp.transformer.*.*(..))")
    private void forTransformerPackage() {
    }

    @Pointcut("forControllerPackage() || forServicePackage() " +
            "|| forUtilPackage() || forDataCachePackage() " +
            "|| forTransformerPackage()")
    private void forAppFlow() {
    }

    // add @Before advice
    @Before("forAppFlow()")
    public void before(JoinPoint theJoinPoint) {
        // display method we are calling
        String theMethod = theJoinPoint.getSignature().toShortString();
        LOGGER.info("=====>> in @Before: calling method: {}", theMethod);

        // display the arguments to the method

        // get the arguments
        Object[] args = theJoinPoint.getArgs();

        // loop thru and display args
        for (Object tempArg : args) {
            LOGGER.info("=====>> argument: {}", tempArg);
        }
    }

    // add @AfterReturning advice
    @AfterReturning(
            pointcut = "forAppFlow()",
            returning = "theResult"
    )
    public void afterReturning(JoinPoint theJoinPoint, Object theResult) {
        // display method we are returning from
        String theMethod = theJoinPoint.getSignature().toShortString();
        LOGGER.info("=====>> in @AfterReturning: from method: {}", theMethod);

        // display data returned
        LOGGER.info("=====>> result: {}", theResult);
    }

}
