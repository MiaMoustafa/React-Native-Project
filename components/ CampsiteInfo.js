import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  PanResponder,
} from "react-native";
import { Card, Button, Rating, Input, Icon } from "react-native-elements";
import * as Animatable from "react-native-animatable";
// import { Icon } from "react-native-elements";
// import { CAMPSITES } from "../shared/campsites";
// import { COMMENTS } from "../shared/comments";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite } from "../redux/ActionCreators";
import { postComment } from "../redux/ActionCreators";

const mapStateToProps = (state) => {
  return {
    campsites: state.campsites,
    comments: state.comments,
    favorites: state.favorites,
  };
};

const mapDispatchToProps = {
  postFavorite: (campsiteId) => postFavorite(campsiteId),
  postComment: (campsiteId, rating, author, text) =>
    postComment(campsiteId, rating, author, text),
};

function RenderCampsite(props) {
  const { campsite } = props;
  const view = React.createRef();

  const recognizeDrag = ({ dx }) => (dx < -50 ? true : false);
  const recognizeComment = ({ dx }) => (dx > -50 ? true : false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      view.current
        .rubberBand(1000)
        .then((endState) =>
          console.log(endState.finished ? "finished" : "canceled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState)) {
        Alert.alert(
          "Add Favorite",
          "Are you sure you wish to add " + campsite.name + " to favorites?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => console.log("Cancel Pressed"),
            },
            {
              text: "OK",
              onPress: () =>
                props.favorite
                  ? console.log("Already set as a favorite")
                  : props.markFavorite(),
            },
          ],
          { cancelable: false }
        );
      } else if (recognizeComment(gestureState)) {
        props.onShowModal();
      }
      return true;
    },
  });

  if (campsite) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        ref={view}
        {...panResponder.panHandlers}
      >
        <Card
          featuredTitle={campsite.name}
          image={{ uri: baseUrl + campsite.image }}
        >
          <Text style={{ margin: 10 }}>{campsite.description}</Text>
          <View style={styles.cardRow}>
            <Icon
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              raised
              reverse
              onPress={() =>
                props.favorite
                  ? console.log("Already set as a favorite")
                  : props.markFavorite()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#5637DD"
              onPress={() => props.onShowModal()}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  }
  return <View />;
}

function RenderComments({ comments }) {
  const renderCommentItem = ({ item }) => {
    return (
      <View style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.text}</Text>
        <Rating
          style={{ fontSize: 14 }}
          startingValue={item.rating}
          imageSize={10}
          readonly="true"
          style={{ alignItems: "flex-start", paddingVertical: "5%" }}
        ></Rating>
        {/* <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text> */}
        <Text
          style={{ fontSize: 12 }}
        >{`-- ${item.author}, ${item.date}`}</Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class CampsiteInfo extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  // campsites: CAMPSITES,
  // comments: COMMENTS,
  //     favorite: false,
  //   };
  // }

  constructor(props) {
    super(props);
    this.state = {
      rating: 0,
      author: "",
      text: "",
      showModal: false,
    };
  }

  markFavorite(campsiteId) {
    this.props.postFavorite(campsiteId);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleComment(campsiteId) {
    // console.log("Current state is: " + JSON.stringify(this.state));
    this.props.postComment(
      campsiteId,
      this.state.author,
      this.state.text,
      this.state.rating
    );
    this.toggleModal();
  }

  // this.postComment(campsiteId, this.state.rating, this.state.author, this.state.text);
  //   this.toggleModal();
  // }

  resetForm() {
    this.setState({
      rating: 0,
      author: "",
      text: "",
      showModal: false,
    });
  }

  static navigationOptions = {
    title: "Campsite Information",
  };

  render() {
    const campsiteId = this.props.navigation.getParam("campsiteId");
    const campsite = this.props.campsites.campsites.filter(
      (campsite) => campsite.id === campsiteId
    )[0];
    const comments = this.props.comments.comments.filter(
      (comment) => comment.campsiteId === campsiteId
    );
    return (
      <ScrollView>
        <RenderCampsite
          campsite={campsite}
          favorite={this.props.favorites.includes(campsiteId)}
          onShowModal={() => this.toggleModal()}
          markFavorite={() => this.markFavorite(campsiteId)}
        />
        <RenderComments comments={comments} />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={styles.modal}>
            <Rating
              showRating
              ratingCount={5}
              onFinishRating={(rating) => this.setState({ rating: rating })}
              imageSize={40}
              style={{ paddingVertical: 10 }}
              startingValue={5}
            />
            <Input
              placeholder="Author"
              leftIcon={{ type: "font-awesome", name: "user-o" }}
              leftIconContainerStyle={{ paddingRight: 10 }}
              value={this.state.author}
              onChangeText={(author) => this.setState({ author: author })}
            />
            <Input
              placeholder="Comment"
              leftIcon={{ type: "font-awesome", name: "comment-o" }}
              leftIconContainerStyle={{ paddingRight: 10 }}
              onChangeText={(text) => this.setState({ text: text })}
              value={this.state.text}
            />

            <View>
              <Button
                title="Submit"
                color="#5637DD"
                buttonStyle={{
                  backgroundColor: "#5637DD",
                }}
                style={styles.styleButton}
                onPress={() => {
                  this.handleComment(campsiteId);
                  this.resetForm();
                }}
              ></Button>
            </View>
            <View>
              <Button
                onPress={() => {
                  this.toggleModal(), this.resetForm();
                }}
                color="#808080"
                buttonStyle={{
                  backgroundColor: "#808080",
                }}
                title="Cancel"
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  cardRow: {
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  modal: {
    justifyContent: "center",
    margin: 20,
    paddingTop: 100,
  },
  Text: {
    fontSize: 18,
    margin: 10,
  },
  styleButton: {
    paddingBottom: 30,
    paddingTop: 20,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);
