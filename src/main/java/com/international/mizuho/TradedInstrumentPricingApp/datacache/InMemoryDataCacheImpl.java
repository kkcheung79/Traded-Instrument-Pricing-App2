package com.international.mizuho.TradedInstrumentPricingApp.datacache;

import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * InMemoryDataCacheImpl provide data store operations
 *
 * @author Ken Cheung
 * @version 1.0
 * @since 2021-07-05
 */
@Component
public class InMemoryDataCacheImpl<K, V> implements InMemoryDataCache<K, V> {

    private final ConcurrentMap<K, V> map;

    public InMemoryDataCacheImpl() {
        map = new ConcurrentHashMap<>();
    }

    @Override
    public Set<V> fetch() {
        return new HashSet<V>(map.values());
    }

    @Override
    public V get(K key) {
        return map.get(key);
    }

    @Override
    public void insertOrUpdate(K key, V value) {
        map.putIfAbsent(key, value);
    }

    @Override
    public void delete(K key) {
        map.remove(key);
    }
}
