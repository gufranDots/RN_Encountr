import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { WrapperContainer } from '../../Components'
import HeaderComp from '../../Components/HeaderComp'
import imagesPath from '../../constants/imagesPath'
import strings from '../../constants/Languages'
import { getMySentRequests } from '../../redux/reduxActions/authActions'
import { ApiError, showError } from '../../utils/helperFunctions'
import { moderateScale, width } from '../../styles/responsiveSize'
import { stableKeyExtractor } from '../../utils/stableKeyExtractor'

const TapsHistory = ({navigation}: {navigation: any}) => {
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchSentRequests()
  }, [])

  const fetchSentRequests = (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    getMySentRequests(pageNum, 10)
      .then(res => {
        console.log('Sent requests response:', res)
        const newData = (res as any)?.data?.data || []
        const totalPages = (res as any)?.data?.last_page || 1
        
        if (pageNum === 1 || isRefresh) {
          setSentRequests(newData)
        } else {
          setSentRequests(prev => [...prev, ...newData])
        }
        
        setHasMore(pageNum < totalPages)
        setPage(pageNum)
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
      })
      .catch(error => {
        console.log('Error fetching sent requests:', error)
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
        showError(ApiError(error))
      })
  }

  const onRefresh = () => {
    setRefreshing(true)
    setPage(1)
    setHasMore(true)
    fetchSentRequests(1, true)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSentRequests(page + 1)
    }
  }

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestItem}>
 <Image source={{uri:item?.sent_to?.profile_image}} style={{width:moderateScale(50),height:moderateScale(50),
    borderRadius: 10}}/>
    <View>
      <Text style={styles.requestText}>
        {item?.sent_to?.first_name}
      </Text>
      <Text style={styles.requestDate}>
        {item?.sent_to?.created_at ? new Date(item?.sent_to?.created_at).toLocaleDateString() : ''}
      </Text>
    </View>
    </View>
  )

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No sent requests found</Text>
    </View>
  )

  return (
  <WrapperContainer 
    isSafeAreaAvailable={true} 
    mainViewStyle={{ flex: 1 }}
    refreshControl={null}
    contentContainerStyle={{ flexGrow: 1 }}
    statusbarcolorr={'#fff'}>
    <HeaderComp
        {...({
            leftIcon: imagesPath.ic_back,
            onPressBack: () => navigation.goBack(),
            centerText: strings.tapsHistory,
        } as any)}
        />
    
    {loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading sent requests...</Text>
      </View>
    ) : (
      <FlatList
        showsVerticalScrollIndicator={false}
        data={sentRequests}
        renderItem={renderRequestItem}
        keyExtractor={stableKeyExtractor}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={() => 
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    )}
  </WrapperContainer>
  )
}

export default TapsHistory

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection:'row',
    gap:moderateScale(10),
  },
  requestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
})
