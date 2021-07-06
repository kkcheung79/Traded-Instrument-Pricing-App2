package com.international.mizuho.TradedInstrumentPricingApp.datacache;

import java.util.Set;

public interface InMemoryDataCache<K, V> {
    Set<V> fetch();
    V get(K key);
    void insertOrUpdate(K key, V value);
    void delete(K key);
}
