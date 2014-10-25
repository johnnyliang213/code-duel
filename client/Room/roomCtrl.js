angular.module('app')
  .controller('roomCtrl', function($scope, $log, $timeout, socket) {
     
     //timer init variables
     $scope.clock = {
       time: 0,
       timer: null,
       notcalled: true
     }

     //here are our variables for start theme and prompt
     var theme = "twilight"; 
     var editor = ace.edit("editor");
     $scope.prompt = '//Your prompt will appear when your opponent joins the room \n //Ask a friend to join this room to duel';
    
    //this adds the editor to the view with default settings
     editor.setTheme("ace/theme/"+ theme);
     editor.getSession().setMode("ace/mode/javascript");
     editor.setValue($scope.prompt);
 
   
     socket.on('joinedRoom', function(room){
       console.log(room + ' has been joined, BABIES');
       $scope.roomname = room;
     });
 
     socket.on('displayPrompt', function(problem){
       console.log('received prompt: ' + JSON.stringify(problem));
       $scope.prompt = problem.prompt;
       $scope.problemName = problem.problemName;

       editor.setValue($scope.prompt);

       //delay clock 1 second to help sync up clocks
       if($scope.clock.notcalled){
         setTimeout(function(){
           $scope.startTimer();
         }, 1000);
         //only call timer 1x
         $scope.clock.notcalled = false;
       }
     });

    socket.on('destroyPrompt', function(){
       $scope.prompt = '//Your prompt will appear momentarily';
       editor.setValue($scope.prompt);
       $scope.stopTimer();
      
     });

    socket.on('sendScore', function(codeScore){
      console.log(codeScore, "CODE SCORE");
      //var codeResult = codeScore.result;
      $scope.score = codeScore;
      editor.setValue('// Your score is: ' + $scope.score + '\n // Now waiting for your opponent to finish');
      //editor.setValue('// Your code resulted in: ' + codeResult + ' ||  Your score is: ' + $scope.score);
     });

    socket.on('isWinner', function(isWinner){
      console.log("is Winner??", JSON.stringify(isWinner.isWinner));
      setTimeout(function(){
        if(isWinner.isWinner){
          editor.setValue('// YOU HAVE WON! Your score is ' + $scope.score + '\n// Your oppenents score was ' + isWinner.opponentScore);
        } else {
          editor.setValue('// YOU HAVE LOST! Your score is ' + $scope.score + '\n// Your oppenents score was ' + isWinner.opponentScore);
        }
      }, 1000);
     });
 
    
    //this is where we will need to test the code
    $scope.submit = function() {
      
      var userCode = editor.getValue();
      console.log('CODE-DUEL: Sending code to be evaluated.');

      socket.emit('sendCode', 
        {
        code: userCode, 
        problemName: $scope.problemName,
        timeTaken: $scope.clock.time
      });
      $scope.stopTimer();
    };
 
    //this resets the editor to the original prompt
    $scope.reset = function() {
      console.log('reset');
      console.log($scope.prompt);
       editor.setValue($scope.prompt);
    };
    
    $scope.startTimer = function() {
      $scope.clock.timer = $timeout(function(){
        $scope.clock.time++;
        $scope.startTimer();
      }, 1000);
    };

    $scope.stopTimer = function() {
      $timeout.cancel($scope.clock.timer);
      $scope.clock.timer = null;
      $scope.clock.time = 0;
      $scope.clock.notcalled = true;
    }

  });