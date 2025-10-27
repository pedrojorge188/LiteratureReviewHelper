package pt.isec.literaturereviewhelper.factories;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.engines.ACMEngine;
import pt.isec.literaturereviewhelper.engines.HalEngine;
import pt.isec.literaturereviewhelper.engines.SpringerEngine;
import pt.isec.literaturereviewhelper.engines.EngineBase;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.ACMResponse;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SearchEngineFactoryTest {
    private WebClient webClient;
    private IResultMapper<ACMResponse> acmMapper;
    private IResultMapper<String> halMapper;
    private IResultMapper<SpringerResponse> springerMapper;

    private SearchEngineFactory factory;

    @BeforeEach
    void setup() {
        webClient = mock(WebClient.class);
        acmMapper = Mockito.mock(IResultMapper.class);
        halMapper = Mockito.mock(IResultMapper.class);
        springerMapper = Mockito.mock(IResultMapper.class);

        factory = new SearchEngineFactory(webClient, acmMapper, halMapper, springerMapper);
    }

    @Test
    void testCreateSearchEngine_ReturnsAcmEngine_WiresDependencies() throws Exception {
        ISearchEngine engine = factory.createSearchEngine(Engines.ACM);
        assertNotNull(engine);
        assertInstanceOf(ACMEngine.class, engine);

        assertSame(webClient, getPrivate(engine, "webClient"));
        assertSame(acmMapper, getPrivate(engine, "mapper"));
    }

    @Test
    void testCreateSearchEngine_ReturnsHalEngine_WiresDependencies() throws Exception {
        ISearchEngine engine = factory.createSearchEngine(Engines.HAL);
        assertNotNull(engine);
        assertInstanceOf(HalEngine.class, engine);

        assertSame(webClient, getPrivate(engine, "webClient"));
        assertSame(halMapper, getPrivate(engine, "mapper"));
    }

    @Test
    void testCreateSearchEngine_ReturnsSpringerEngine_WiresDependencies() throws Exception {
        ISearchEngine engine = factory.createSearchEngine(Engines.SPRINGER);
        assertNotNull(engine);
        assertInstanceOf(SpringerEngine.class, engine);

        assertSame(webClient, getPrivate(engine, "webClient"));
        assertSame(springerMapper, getPrivate(engine, "mapper"));
    }

    private Object getPrivate(ISearchEngine engine, String fieldName) throws Exception {
        Field f = EngineBase.class.getDeclaredField(fieldName);
        f.setAccessible(true);
        return f.get(engine);
    }
}
